import {
  Type,
  Mail,
  Lock,
  Hash,
  Phone,
  Link as LinkIcon,
  AlignLeft,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Calendar,
  Clock,
  Upload,
  EyeOff,
} from 'lucide-react'

const ICONS_BY_KEY = {
  text: Type,
  mail: Mail,
  lock: Lock,
  hash: Hash,
  phone: Phone,
  link: LinkIcon,
  'align-left': AlignLeft,
  'chevron-down': ChevronDown,
  'circle-dot': CircleDot,
  'check-square': CheckSquare,
  calendar: Calendar,
  clock: Clock,
  upload: Upload,
  'eye-off': EyeOff,
}

/** Resolves a registry entry's `icon` key (e.g. "mail") to its Lucide component. */
export function FieldTypeIcon({ iconKey, ...rest }) {
  const Icon = ICONS_BY_KEY[iconKey] ?? Type
  return <Icon size={16} strokeWidth={2} {...rest} />
}
