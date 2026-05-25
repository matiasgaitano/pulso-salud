import { NextRequest, NextResponse } from "next/server";
import { getPaymentById } from "@/lib/mercadopago";
import { db } from "@/lib/db";
import crypto from "crypto";

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // skip in dev if not configured

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.trim().split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return hash === v1;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify MercadoPago signature
  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: { type?: string; data?: { id?: string | number } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  // Guard: data.id must exist and be a non-empty value
  const paymentId = body.data?.id;
  if (paymentId === undefined || paymentId === null || paymentId === "") {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await getPaymentById(String(paymentId));
    const consultationId = payment.external_reference;

    if (!consultationId) {
      return NextResponse.json({ ok: true });
    }

    const statusMap: Record<string, "approved" | "rejected" | "pending" | "refunded"> = {
      approved: "approved",
      rejected: "rejected",
      pending:  "pending",
      refunded: "refunded",
    };

    const paymentStatus = statusMap[payment.status ?? ""] ?? "pending";

    await db.consultations.update(consultationId, {
      paymentStatus,
      paymentId: String(payment.id),
      ...(paymentStatus === "approved" ? { status: "paid" } : {}),
    });
  } catch (err) {
    console.error("Webhook error:", err);
    // Return 200 to avoid MercadoPago retries on genuine errors
  }

  return NextResponse.json({ ok: true });
}
