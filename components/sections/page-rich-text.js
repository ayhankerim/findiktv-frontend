import PropTypes from "prop-types"

const RichText = ({ data }) => {
  return (
    <article
      className="container NewsContent py-12 text-base bg-white"
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
