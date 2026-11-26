import { useNavigate } from "react-router"
import { registry } from "../../registry"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export function MultivitaminPicker({ current }: { current: string }) {
  const navigate = useNavigate()
  return (
    <Select
      value={current}
      onValueChange={(value) => {
        if (value && value !== current) navigate(`/${value}`)
      }}
      items={registry.map((entry) => ({ value: entry.id, label: entry.title }))}
    >
      <SelectTrigger aria-label="Multivitamin">
        <SelectValue placeholder="Choose a multivitamin" />
      </SelectTrigger>
      <SelectContent>
        {registry.map((entry) => (
          <SelectItem key={entry.id} value={entry.id}>
            {entry.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
