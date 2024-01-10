import PropTypes from "prop-types"

const RichText = ({ data }) => {
  return (
    <article
      className="NewsContent text-base"
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
