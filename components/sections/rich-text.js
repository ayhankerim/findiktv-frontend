import PropTypes from "prop-types"

const RichText = ({ data }) => {
  return (
    <article
      className="NewsContent container py-12"
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  )
}

RichText.propTypes = {
  data: PropTypes.shape({
    content: PropTypes.string,
  }),
}

export default RichText
