import { useRef } from "react"
import propTypes from "prop-types"

const Tooltip = ({ children, tooltipText, orientation = "right", version }) => {
  const tipRef = useRef(null)
  const orientations = {
    right: "right",
    top: "top",
    left: "left",
    bottom: "bottom",
  }

  function handleMouseEnter() {
    tipRef.current.style.opacity = 1
  }

  function handleMouseLeave() {
    tipRef.current.style.opacity = 0
  }

  const setContainerPosition = (orientation) => {
    let classnames

    switch (orientation) {
      case orientations.right:
        classnames = "top-0 left-full ml-4"
        break
      case orientations.left:
        classnames = "top-0 right-full mr-4"
        break
      case orientations.top:
        classnames = "bottom-full left-[50%] translate-x-[-50%] -translate-y-2"
        break
      case orientations.bottom:
        classnames = "top-full left-[50%] translate-x-[-50%] translate-y-2"
        break

      default:
        break
    }

    return classnames
  }

  const setPointerPosition = (orientation) => {
    let classnames

    switch (orientation) {
      case orientations.right:
        classnames = "left-[-6px]"
        break
      case orientations.left:
        classnames = "right-[-6px]"
        break
      case orientations.top:
        classnames = "top-full left-[50%] translate-x-[-50%] -translate-y-2"
        break
      case orientations.bottom:
        classnames = "bottom-full left-[50%] translate-x-[-50%] translate-y-2"
        break

      default:
        break
    }

    return classnames
  }

  const classContainer = `w-max absolute z-10 ${setContainerPosition(
    orientation
  )} bg-gray-600 text-white text-sm px-2 py-1 rounded flex items-center transition-all duration-150 pointer-events-none`

  const pointerClasses = `bg-gray-600 h-3 w-3 absolute z-10 ${setPointerPosition(
    orientation
  )} rotate-45 pointer-events-none`
  if (version === "clean")
    return (
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={classContainer} style={{ opacity: 0 }} ref={tipRef}>
          <div className={pointerClasses} />
          {tooltipText}
        </div>
        {children}
      </div>
    )
  else
    return (
      <div
        className="relative flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={classContainer} style={{ opacity: 0 }} ref={tipRef}>
          <div className={pointerClasses} />
          {tooltipText}
        </div>
        {children}
      </div>
    )
}

Tooltip.propTypes = {
  orientation: propTypes.oneOf(["top", "left", "right", "bottom"]),
  tooltipText: propTypes.string.isRequired,
}
export default Tooltip
