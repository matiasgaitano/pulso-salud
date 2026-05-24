import { NextRequest, NextResponse } from "next/server";
import { getPaymentById } from "@/lib/mercadopago";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // MercadoPago sends topic=payment for payment notifications
  if (body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await getPaymentById(String(body.data?.id));
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

    db.consultations.update(consultationId, {
      paymentStatus,
      paymentId: String(payment.id),
      ...(paymentStatus === "approved" ? { status: "paid" } : {}),
    });
  } catch (err) {
    console.error("Webhook error:", err);
    // Return 200 to avoid MercadoPago retries
  }

  return NextResponse.json({ ok: true });
}
