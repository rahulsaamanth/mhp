export type ImageType = "product" | "profile" | "banner"

export class CloudinaryService {
  private readonly cloudName: string
  private readonly signedPreset: string
  private readonly unsignedPreset: string

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    this.signedPreset = process.env.CLOUDINARY_SIGNED_PRESET!
    this.unsignedPreset = process.env.CLOUDINARY_UNSIGNED_PRESET!
  }

  private getUploadUrl(): string {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`
  }

  async uploadImage(
    file: File,
    type: ImageType,
    userId?: string
  ): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      switch (type) {
        case "profile":
          formData.append("upload_preset", this.unsignedPreset)
          formData.append("folder", `mhp/user-profiles`)
          break
        case "product":
          formData.append("upload_preset", this.signedPreset)
          formData.append("folder", `products`)
          break
        case "banner":
          formData.append("upload_preset", this.signedPreset)
          formData.append("folder", "banners")
          break
        default:
          throw new Error("Invalid image type")
      }
      const response = await fetch(this.getUploadUrl(), {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()

      return data.secure_url
    } catch (error) {
      console.error("Upload error:", error)
      throw new Error("Failed to upload image")
    }
  }
}

export const cloudinaryService = new CloudinaryService()
