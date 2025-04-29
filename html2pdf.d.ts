declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      letterRendering?: boolean
      logging?: boolean
    }
    jsPDF?: {
      unit?: string
      format?: string
      orientation?: "portrait" | "landscape"
    }
  }

  interface Html2PdfInstance {
    from(element: HTMLElement | string): Html2PdfInstance
    set(options: Html2PdfOptions): Html2PdfInstance
    save(): Promise<void>
    toPdf(): any
    toImg(): any
    toCanvas(): Promise<HTMLCanvasElement>
    output(type: string, options?: any): any
  }

  function html2pdf(): Html2PdfInstance
  function html2pdf(
    element: HTMLElement | string,
    options?: Html2PdfOptions
  ): Html2PdfInstance

  export default html2pdf
}
