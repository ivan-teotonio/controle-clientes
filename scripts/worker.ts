// import {
//   SQSClient,
//   ReceiveMessageCommand,
//   DeleteMessageCommand,
// } from "@aws-sdk/client-sqs";
// import nodemailer from "nodemailer";
// import { ServiceOrderService } from "@/app/services/service-order.service"; // Ajuste o caminho se necessário
// import { ClientService } from "@/app/services/client.service";
// import { TechnicianService } from "@/app/services/technician.service";

// // Configurações
// const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
// const serviceOrderService = new ServiceOrderService();
// const clientService = new ClientService();
// const techService = new TechnicianService();

// export async function processarFila() {
//   // Configuração do Ethereal (teste)
//   const testAccount = await nodemailer.createTestAccount();
//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     auth: { user: testAccount.user, pass: testAccount.pass },
//   });

//   console.log("Worker iniciado, aguardando mensagens...");

//   const data = await sqsClient.send(
//     new ReceiveMessageCommand({
//       QueueUrl: process.env.SQS_QUEUE_URL,
//       MaxNumberOfMessages: 1,
//       WaitTimeSeconds: 20,
//     }),
//   );

//   if (data.Messages) {
//     for (const message of data.Messages) {
//       try {
//         const body = JSON.parse(message.Body!);
//         console.log(`Processando evento: ${body.evento} para OS #${body.osId}`);

//         // 1. Definir texto conforme o evento
//         let assunto = "";
//         let corpoTexto = "";

//         if (body.evento === "OS_CRIADA") {
//           assunto = `Nova Ordem de Serviço #${body.osId} Aberta`;
//           corpoTexto = `Olá! Informamos que uma nova OS foi aberta e atribuída ao técnico.`;
//         } else if (body.evento === "STATUS_ALTERADO") {
//           assunto = `Atualização na OS #${body.osId}`;
//           corpoTexto = `Olá! O status da OS #${body.osId} foi alterado para: ${body.novoStatus}.`;
//         }

//         // 2. Buscar contatos no banco
//         const cliente = await clientService.findById(body.clientId);
//         const tecnico = await techService.findById(body.technicianId);

//         const emailsParaEnviar = [];
//         if (cliente?.email) emailsParaEnviar.push(cliente.email);
//         if (tecnico?.email) emailsParaEnviar.push(tecnico.email);

//         // 3. Enviar e-mail
//         if (emailsParaEnviar.length > 0) {
//           const info = await transporter.sendMail({
//             from: '"Sistema OS" <noreply@osmanager.com>',
//             to: emailsParaEnviar.join(", "),
//             subject: assunto,
//             text: `${corpoTexto}\n\nAcesse o sistema para mais detalhes.`,
//           });
//           console.log(
//             "E-mail enviado! Veja em: %s",
//             nodemailer.getTestMessageUrl(info),
//           );
//         } else {
//           console.warn(`Nenhum e-mail encontrado para OS #${body.osId}`);
//         }

//         // 4. Apagar da fila após sucesso
//         await sqsClient.send(
//           new DeleteMessageCommand({
//             QueueUrl: process.env.SQS_QUEUE_URL,
//             ReceiptHandle: message.ReceiptHandle,
//           }),
//         );
//         console.log("Mensagem removida da fila.");
//       } catch (err) {
//         console.error("Erro ao processar mensagem:", err);
//       }
//     }
//   }
// }

// // Rodar o processo
// processarFila().catch(console.error);

import { prisma } from "@/app/lib/prisma"; // Importa sua conexão com o banco
import { receberDaFila, deletarDaFila } from "@/app/lib/sqs";

export async function processarFila() {
  const mensagem = await receberDaFila();
  if (!mensagem) return;

  const corpo = JSON.parse(mensagem.Body || "{}");

  try {
    // Busca a OS completa no banco para ter acesso aos dados (cliente, técnico, etc)
    const order = await prisma.serviceOrder.findUnique({
      where: { id: corpo.osId },
      include: {
        client: { select: { name: true, email: true } },
        technician: { select: { name: true, email: true } },
      },
    });

    if (!order) throw new Error("OS não encontrada no banco");

    switch (corpo.evento) {
      case "OS_CRIADA":
        // Exemplo: Envia e-mail para o cliente avisando que foi aberta
        await enviarEmail(
          order.client.email,
          "Nova OS Aberta",
          `Olá ${order.client.name}, sua OS #${order.id} foi criada.`,
        );
        break;

      case "STATUS_ALTERADO":
        // Exemplo: Envia e-mail para cliente e técnico sobre a mudança
        await enviarEmail(
          order.client.email,
          "Status Alterado",
          `O status da sua OS mudou para: ${corpo.novoStatus}`,
        );
        if (order.technician?.email) {
          await enviarEmail(
            order.technician.email,
            "OS Atualizada",
            `A OS #${order.id} mudou para ${corpo.novoStatus}`,
          );
        }
        break;
    }

    await deletarDaFila(mensagem.ReceiptHandle!);
  } catch (error) {
    console.error("Erro no Worker:", error);
  }
}

// Função simples para abstrair o nodemailer
async function enviarEmail(to: string, subject: string, text: string) {
  console.log(`Enviando e-mail para ${to}: ${subject}`);
  // Aqui entra o seu código do nodemailer que discutimos antes
}
