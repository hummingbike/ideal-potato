import type { SegmentationPort } from "../ports/segmentation";
import type { CellPosition, FurnitureItem, ItemSize } from "./types";

export interface ExtractFurnitureInput {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  sourceCell: CellPosition;
  size: ItemSize;
}

/** Runs a cell photo through the segmentation port and turns the result into a FurnitureItem. */
export async function extractFurniture(
  segmenter: SegmentationPort,
  input: ExtractFurnitureInput,
): Promise<FurnitureItem> {
  const result = await segmenter.segment(input.imageUrl);

  return {
    id: input.id,
    name: input.name,
    category: input.category,
    size: input.size,
    originalImageUrl: input.imageUrl,
    segmentedImageUrl: result.croppedImageUrl,
    sourceCell: input.sourceCell,
  };
}
