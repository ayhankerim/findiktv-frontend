export function categoryColor(cat) {
  switch (cat) {
    case "ekonomi":
      return "#0846c4"
      break
    case "3-sayfa":
      return "#d4111b"
      break
    case "spor":
      return "#5b991b"
      break
    case "siyaset":
      return "#c37c09"
      break
    case "gundem":
      return "#276344"
      break
    case "kultur-sanat":
      return "#aa007b"
      break
    case "teknoloji":
      return "#0055ff"
      break
    default:
      return "rgb(107,114,128)"
      break
  }
}
