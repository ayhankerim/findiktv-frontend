export function categoryColor(cat) {
  switch (cat) {
    case "ekonomi":
      return "#0846c4"
    case "3-sayfa":
      return "#d4111b"
    case "spor":
      return "#5b991b"
    case "siyaset":
      return "#c37c09"
    case "gundem":
      return "#276344"
    case "kultur-sanat":
      return "#aa007b"
    case "teknoloji":
      return "#0055ff"
    default:
      return "rgb(107,114,128)"
  }
}
