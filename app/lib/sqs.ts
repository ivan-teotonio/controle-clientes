// app/lib/sqs.ts
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function enviarParaFila(mensagem: any) {
  try {
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(mensagem),
      }),
    );
  } catch (erro) {
    console.error("Erro ao enviar para o SQS:", erro);
    // Não bloqueamos o fluxo principal da OS se o SQS falhar
  }
}
