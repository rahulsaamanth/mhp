import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { ControllerRenderProps } from "react-hook-form"
import { createProductSchema } from "@/schemas"
import * as z from "zod"
import { toast } from "sonner"
import { uploadProductImage } from "../_lib/actions"

type VariantImageUploadProps = {
  field: ControllerRenderProps<
    z.infer<typeof createProductSchema>,
    `variants.${number}.variantImage`
  >
  index: number
}

type ImagePreviewProps = {
  url: string
  alt: string
  position: { x: number; y: number } | null
}

export const VariantImageUpload = ({
  field,
  index,
}: VariantImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)

  const [previewUrls, setPreviewUrls] = useState<string[]>(
    Array.isArray(field.value) ? field.value : []
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    setIsUploading(true)

    const files = Array.from(e.target.files)

    const uploadPromises = files.map(async (file) => {
      try {
        const imageUrl = await uploadProductImage(file)
        return imageUrl
      } catch (error) {
        console.error(`Failed to upload ${file.name}`, error)
        toast.error(`Failed to upload ${file.name}`)
        return null
      }
    })

    try {
      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter((url): url is string => url !== null)

      field.onChange([...(field.value || []), ...validUrls])
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Failed to upload images")
    } finally {
      setIsUploading(false)
    }

    // Create preview URLs for new files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])

    // Update the form field value
    field.onChange(files)
  }

  const handleRemoveImage = (imageIndex: number) => {
    const newFiles = Array.from(field.value as unknown as FileList).filter(
      (_, i) => i !== imageIndex
    )

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[imageIndex]!)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== imageIndex)

    setPreviewUrls(newPreviewUrls)
    field.onChange(newFiles)
  }

  // Add these states in your component
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<ImagePreviewProps>({
    url: "",
    alt: "",
    position: null,
  })

  return (
    <FormItem>
      <FormControl>
        <div className="flex items-center gap-2">
          {field.value && (previewUrls.length > 0 || field.value.length > 0) ? (
            <div className="flex gap-2 items-center">
              <div className="flex space-x-4">
                {previewUrls.map((url, imgIndex) => (
                  <div key={imgIndex} className="relative">
                    <div
                      className="size-10 border-2 border-background overflow-hidden"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setPreviewImage({
                          url,
                          alt: `Varinat ${index + 1} image ${imgIndex + 1}`,
                          position: {
                            x: rect.x - 100,
                            y: rect.y - 400,
                          },
                        })
                        setShowPreview(true)
                      }}
                      onMouseLeave={() => setShowPreview(false)}
                    >
                      <Image
                        src={url}
                        alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                        width={40}
                        height={40}
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder-image.jpg"
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-4 w-4 absolute -top-1 -right-1"
                      onClick={() => {
                        const newUrls = field.value.filter(
                          (_: string, i: number) => i !== imgIndex
                        )
                        field.onChange(newUrls)
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`variant-${index}-images`}
                  className="cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id={`variant-${index}-images`}
                  onChange={handleFileChange}
                />

                {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                  >
                  </Button> */}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label
                htmlFor={`variant-${index}-images`}
                className="cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id={`variant-${index}-images`}
                onChange={handleFileChange}
              />
              {/* <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8"
                >
                </Button> */}
              <span className="text-sm text-muted-foreground">No images</span>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
      {showPreview && previewImage.position && (
        <div
          className="fixed z-50 rounded-md border bg-background shadow-lg"
          style={{
            top: `${previewImage.position.y}px`,
            left: `${previewImage.position.x}px`,
          }}
        >
          <div className="size-72 overflow-hidden">
            <Image
              src={previewImage.url}
              alt={previewImage.alt}
              width={100}
              height={100}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </FormItem>
  )
}
