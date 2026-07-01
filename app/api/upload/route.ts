import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType } = await req.json();
    const key = `equipments/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ url, key });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao gerar URL de upload" },
      { status: 500 },
    );
  }
}
