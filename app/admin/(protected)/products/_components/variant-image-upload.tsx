import { Button } from "@/components/ui/button"
import { FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { createProductSchema } from "@/schemas"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { ControllerRenderProps } from "react-hook-form"
import * as z from "zod"

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
  position: { x: number; y: number; width: number } | null
}

export const VariantImageUpload = ({
  field,
  index,
}: VariantImageUploadProps) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    Array.isArray(field.value) ? field.value : []
  )
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<ImagePreviewProps>({
    url: "",
    alt: "",
    position: null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const files = Array.from(e.target.files)
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    field.onChange([...(field.value || []), ...files])
  }

  const handleRemoveImage = (imageIndex: number) => {
    const newFiles = Array.from(field.value as unknown as FileList).filter(
      (_, i) => i !== imageIndex
    )

    URL.revokeObjectURL(previewUrls[imageIndex]!)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== imageIndex)

    setPreviewUrls(newPreviewUrls)
    field.onChange(newFiles)
  }

  const calculatePreviewPosition = (rect: DOMRect) => {
    const padding = 16
    const previewWidth = 288 // 18rem = 288px
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = rect.right + padding
    let y = rect.top

    if (x + previewWidth > viewportWidth) {
      x = rect.left - previewWidth - padding
    }

    if (y + previewWidth > viewportHeight) {
      y = viewportHeight - previewWidth - padding
    }

    if (y < 0) {
      y = padding
    }

    return { x, y, width: previewWidth }
  }

  const renderImageGrid = () => (
    <div className="flex flex-wrap gap-2 items-center">
      {previewUrls.map((url, imgIndex) => (
        <div
          key={imgIndex}
          className="relative group rounded-md overflow-hidden border bg-background"
        >
          <div
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setPreviewImage({
                url,
                alt: `Variant ${index + 1} image ${imgIndex + 1}`,
                position: calculatePreviewPosition(rect),
              })
              setShowPreview(true)
            }}
            onMouseLeave={() => setShowPreview(false)}
            className="size-10 relative"
          >
            <Image
              src={url}
              alt={`Variant ${index + 1} image ${imgIndex + 1}`}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder-image.jpg"
              }}
            />
          </div>
          <Button
            onClick={() => handleRemoveImage(imgIndex)}
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-0 top-0 size-4 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        asChild
      >
        <label htmlFor={`variant-${index}-images`} className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id={`variant-${index}-images`}
            onChange={handleFileChange}
          />
          <Upload className="size-4" />
        </label>
      </Button>
    </div>
  )

  return (
    <FormItem>
      <FormControl>
        <div className="space-y-2">
          {renderImageGrid()}

          {showPreview && previewImage.position && (
            <div
              className="fixed z-50 rounded-md overflow-hidden shadow-xl border border-border"
              style={{
                left: `${previewImage.position.x}px`,
                top: `${previewImage.position.y}px`,
                width: `${previewImage.position.width}px`,
                height: `${previewImage.position.width}px`,
              }}
            >
              <div className="relative w-full h-full bg-muted">
                <Image
                  src={previewImage.url}
                  alt={previewImage.alt}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-image.jpg"
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-xs">
                {previewImage.alt}
              </div>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}
