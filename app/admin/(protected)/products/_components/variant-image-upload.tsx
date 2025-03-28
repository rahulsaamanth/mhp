import { Button } from "@/components/ui/button"
import { FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { createProductSchema } from "@/schemas"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { ControllerRenderProps } from "react-hook-form"
import * as z from "zod"
import { compressImage } from "@/lib/compress-image"

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const files = Array.from(e.target.files)

    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file)
          return compressed
        })
      )

      const newPreviewUrls = compressedFiles.map((file) =>
        URL.createObjectURL(file)
      )
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
      field.onChange([...(field.value || []), ...compressedFiles])
    } catch (error) {
      console.error("Error compressing images:", error)
    }
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

  const renderImagePreview = (url: string, imgIndex: number) => (
    <div key={imgIndex} className="relative group">
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
        className="size-10 border-2 border-background overflow-hidden transition-transform group-hover:scale-105"
      >
        <Image
          src={url}
          alt={`Variant ${index + 1} image ${imgIndex + 1}`}
          width={40}
          height={40}
          className="size-full object-cover"
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
        className="absolute -right-1 -top-1 size-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="size-2" />
      </Button>
    </div>
  )

  const renderUploadButton = () => (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        id={`variant-${index}-images`}
        onChange={handleFileChange}
      />
      <label htmlFor={`variant-${index}-images`} className="cursor-pointer">
        <Upload className="size-4" />
      </label>
    </div>
  )

  const renderHoverPreview = () =>
    showPreview &&
    previewImage.position && (
      <div
        className={cn(
          "fixed z-50 rounded-lg border bg-background shadow-lg",
          "animate-in fade-in zoom-in-95"
        )}
        style={{
          top: `${previewImage.position.y}px`,
          left: `${previewImage.position.x}px`,
          width: `${previewImage.position.width}px`,
        }}
      >
        <div className="aspect-square overflow-hidden rounded-lg">
          <Image
            src={previewImage.url}
            alt={previewImage.alt}
            width={400}
            height={400}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </div>
    )

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
        <div className="space-y-2">{renderImageGrid()}</div>
      </FormControl>
      <FormMessage />
      {renderHoverPreview()}
    </FormItem>
  )
}
