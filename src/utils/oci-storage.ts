import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// OCI Object Storage through its S3-compatible API.
// Endpoint format: https://<namespace>.compat.objectstorage.<region>.oraclecloud.com
const endpoint = process.env.OCI_object_endpoint;
const accessKeyId = process.env.access_key_id;
const secretAccessKey = process.env.secret_access_key;
const bucket = process.env.bucket_name;

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    "OCI_object_endpoint, access_key_id, secret_access_key and bucket_name must be set"
  );
}

const region =
  process.env.OCI_REGION ??
  endpoint.match(/objectstorage\.([a-z0-9-]+)\.oraclecloud\.com/)?.[1];

if (!region) {
  throw new Error(
    "Could not determine the OCI region from OCI_object_endpoint; set OCI_REGION"
  );
}

// SigV4 allows presigned URLs for at most 7 days (604800 seconds).
const signedUrlExpiresIn = parseInt(
  process.env.OCI_SIGNED_URL_EXPIRES_IN || "604800",
  10
);

const client = new S3Client({
  endpoint,
  region,
  // OCI's S3 compatibility endpoint uses bucket names in the path.
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
  // Newer AWS SDK releases add CRC checksums by default, which OCI can reject.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const putFile = async (
  key: string,
  body: Buffer,
  contentType: string,
  metadata: Record<string, string> = {}
) => {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
      Metadata: metadata,
    })
  );
};

// S3 delete is idempotent: deleting a missing key does not fail.
export const deleteFile = async (key: string) => {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

// Returns a time-limited URL the browser can load directly from the bucket.
export const getFileUrl = async (key: string): Promise<string> => {
  try {
    return await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: signedUrlExpiresIn }
    );
  } catch (error) {
    console.error(error);
    return "Picture not found";
  }
};
