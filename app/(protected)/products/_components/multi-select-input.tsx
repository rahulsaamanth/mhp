import { useRef, useState } from "react"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type MultiSelectInputProps = {
  options: string[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
}

const COMMON_TAGS = [
  "Tablet",
  "Capsule",
  "Liquid",
  "Injection",
  "Syrup",
  "Cream",
  "Powder",
  "Gel",
  "Spray",
  "test1",
  "test2",
  "test3",
]

export const MultiSelectInput = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Search tags...",
}: MultiSelectInputProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value)
  const [searchTerm, setSearchTerm] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  const getFilteredOptions = () => {
    if (searchTerm) {
      return options.filter((opt) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return options.filter((opt) => COMMON_TAGS.includes(opt)).length > 0
      ? options.filter((opt) => COMMON_TAGS.includes(opt))
      : options.slice(0, 12)
  }

  const filteredOptions = getFilteredOptions()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission
    if (e.key === "Enter") {
      e.preventDefault()
      return
    }

    if (e.key === "Backspace" && !searchTerm && selectedOptions.length > 0) {
      const newSelection = selectedOptions.slice(0, -1)
      setSelectedOptions(newSelection)
      onChange?.(newSelection)
    }
  }

  const toggleOption = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option]

    setSelectedOptions(newSelection)
    onChange?.(newSelection)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Selected Tags Display */}
      <div
        className="min-h-[42px] w-full border rounded-lg bg-background p-2 flex flex-wrap gap-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedOptions.map((option) => (
          <span
            key={option}
            className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1 text-sm"
          >
            {option}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleOption(option)
              }}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}

        <div className="flex-1 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-8 pr-4 py-1 outline-none text-sm bg-transparent"
            placeholder={searchTerm ? placeholder : "Search more tags.."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Options Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                "border border-input hover:bg-accent",
                selectedOptions.includes(option) &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                !searchTerm && !COMMON_TAGS.includes(option) && "hidden"
              )}
            >
              {option}
            </button>
          ))}
          {filteredOptions.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-4">
              No matching tags found
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
