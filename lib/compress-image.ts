export const compressImage = async (file: File): Promise<File> => {
  // Return early if already WebP format
  if (file.type === "image/webp") {
    return file
  }

  // Limit max width/height while maintaining aspect ratio
  const maxDimension = 1200

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName =
                file.name.substring(0, file.name.lastIndexOf(".")) + ".webp"

              const convertedFile = new File([blob], fileName, {
                type: "image/webp",
                lastModified: Date.now(),
              })
              resolve(convertedFile)
            } else {
              resolve(file)
            }
          },
          "image/webp",
          1.0 // change this value to adjust quality (0.0 - 1.0)
        )
      }
    }
  })
}
