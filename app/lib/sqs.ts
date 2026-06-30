// app/lib/sqs.ts
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function receberDaFila() {
  const command = new ReceiveMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    MaxNumberOfMessages: 1, // Pega uma por vez
    WaitTimeSeconds: 5, // Long polling (ajuda na economia e performance)
  });

  const resposta = await sqsClient.send(command);
  return resposta.Messages ? resposta.Messages[0] : null;
}

export async function deletarDaFila(receiptHandle: string) {
  const command = new DeleteMessageCommand({
    QueueUrl: process.env.SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  });
  return await sqsClient.send(command);
}

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
