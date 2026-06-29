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
  console.log("Tentando enviar para a fila..."); // Adiciona isto
  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(mensagem),
    });
    const resposta = await sqsClient.send(command);
    console.log("Sucesso! ID da mensagem:", resposta.MessageId);
  } catch (erro) {
    console.error("ERRO DETALHADO NO SQS:", erro); // Isto vai-nos dar a pista final
  }
}
