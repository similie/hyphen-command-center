<script lang="ts">
  import { Button, Card } from "flowbite-svelte";
  import Cropper, { type OnCropCompleteEvent } from "svelte-easy-crop";
  import { _t } from "$lib";

  type CroppedArea = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  let {
    fileUrl,
    filename,
    crop,
    cropValues = { x: 0, y: 0 },
    zoom = 1,
    convertedExtension = "jpg",
    aspect = 4 / 3,
  } = $props<{
    fileUrl: string;
    filename: string;
    crop: (file: File) => void;
    cropValues?: { x: number; y: number };
    zoom?: number;
    aspect?: number;
    convertedExtension?: string;
  }>();
  // const dispatch = createEventDispatcher<{ crop: File }>();
  // const { crop } = $svelteProps();

  let croppedAreaPixels: CroppedArea | null = $state(null); // Stores the crop details in pixel values
  // export let convertedExtension = "jpeg";
  // Handle the crop area change
  const onCropComplete = (e: OnCropCompleteEvent) => {
    const { pixels } = e;
    croppedAreaPixels = pixels;
  };

  const getCroppedImg = async (
    imageSrc: string,
    crop: any,
  ): Promise<Blob | null> => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject("Failed to get canvas context");
          return;
        }

        // Set the canvas size to the crop size
        canvas.width = crop.width;
        canvas.height = crop.height;

        // Draw the image onto the canvas, cropping it according to the crop data
        ctx.drawImage(
          image,
          crop.x, // Start cropping at x
          crop.y, // Start cropping at y
          crop.width, // Crop width
          crop.height, // Crop height
          0, // Place it on canvas at x=0
          0, // Place it on canvas at y=0
          crop.width, // Draw width
          crop.height, // Draw height
        );
        // Set image smoothing to false to retain sharpness
        ctx.imageSmoothingEnabled = false;
        // Convert the canvas to a blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject("Failed to create blob from canvas");
          }
        }, `image/${convertedExtension}`); // You can change the format (e.g., 'image/png')
      };
    });
  };

  const getFileName = () => {
    return `${filename.split(".")[0]}-cropped.${convertedExtension}`;
  };

  const uploadCroppedImage = async () => {
    const croppedImageBlob = await getCroppedImg(fileUrl, croppedAreaPixels);
    if (!croppedImageBlob) {
      return;
    }
    const file = new File([croppedImageBlob as Blob], getFileName(), {
      type: "image/jpeg",
    });
    // dispatch("crop", file);
    crop(file);
  };
</script>

{#if fileUrl}
  <Card class="p-6">
    <div class="flex-col space-y-2">
      <div class="relative w-64 h-64 ml-auto mr-auto">
        <Cropper
          image={fileUrl}
          bind:crop={cropValues}
          bind:zoom
          {aspect}
          oncropcomplete={onCropComplete}
        />
      </div>
      <div class="flex items-center justify-center">
        <Button color="primary" size="sm" onclick={uploadCroppedImage}
          >{$_t("Save Crop")}</Button
        >
      </div>
    </div>
  </Card>
{/if}
