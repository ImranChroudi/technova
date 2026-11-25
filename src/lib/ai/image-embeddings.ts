import { pipeline, RawImage } from "@huggingface/transformers";

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
  }
  return extractor;
}

export async function generateImageEmbedding(file: Blob): Promise<number[]> {
  const model = await getExtractor();

  const image = await RawImage.fromBlob(file);

  const output = await model(image);

  // Extract the embedding output (Supabase pattern)
  const embedding = Array.from(output.data as ArrayLike<number>) as number[];

  return embedding;
}
