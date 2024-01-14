import PropTypes from "prop-types"
import dynamic from "next/dynamic"
const Loader = ({ cssClass }) => (
  <div className={`lds-ellipsis ${cssClass}`}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)
const Slider = dynamic(() => import("@/components/elements/slider"), {
  loading: () => <Loader />,
})
const ArticleMostVisited = dynamic(
  () => import("@/components/elements/article/articles-most-visited-v2"),
  {
    loading: () => <Loader />,
  }
)
const SliderWithSide = ({ data }) => {
  return (
    <div className="container flex flex-col lg:flex-row lg:flex-nowrap gap-2 align-top pb-6">
      <div className="w-full lg:w-8/12">
        <Slider data={data} />
      </div>
      <div className="w-full lg:w-4/12">
        <ArticleMostVisited
          size={data.SideArticleLimit}
          offset={data.SideArticleOffset}
          position="sidebar"
          slug={null}
        />
      </div>
    </div>
  )
}

SliderWithSide.propTypes = {
  data: PropTypes.shape({
    SlideLimit: PropTypes.number,
    SliderOffset: PropTypes.number,
    SideArticleLimit: PropTypes.number,
    SideArticleOffset: PropTypes.number,
    FeaturedOnly: PropTypes.bool,
  }),
}

export default SliderWithSide
