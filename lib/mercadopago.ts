import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { Specialist } from "@/types";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
});

const preference = new Preference(client);
const payment = new Payment(client);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createConsultationPreference(
  consultationId: string,
  specialist: Specialist,
  patientEmail: string
) {
  const result = await preference.create({
    body: {
      items: [
        {
          id: `consulta-${consultationId}`,
          title: `Segunda opinión médica — ${specialist.name}`,
          description: `Teleconsulta con ${specialist.name} (${specialist.specialty})`,
          quantity: 1,
          unit_price: specialist.priceARS,
          currency_id: "ARS",
        },
      ],
      payer: {
        email: patientEmail,
      },
      back_urls: {
        success: `${APP_URL}/consultation/${consultationId}/success`,
        failure: `${APP_URL}/consultation/${consultationId}/payment`,
        pending: `${APP_URL}/consultation/${consultationId}/payment`,
      },
      auto_return: "approved",
      notification_url: `${APP_URL}/api/mercadopago/webhook`,
      external_reference: consultationId,
      statement_descriptor: "PULSO SALUD",
      expires: false,
    },
  });

  return result;
}

export async function getPaymentById(paymentId: string) {
  return payment.get({ id: paymentId });
}

export { client as mpClient };
