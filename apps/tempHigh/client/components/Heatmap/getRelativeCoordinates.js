export default function getRelativeCoordinates(e, container) {
  const pos = {};
  const offset = {};
  let ref;

  ref = container.offsetParent;
  pos.x = e.touches ? e.touches[0].pageX : e.pageX;
  pos.y = e.touches ? e.touches[0].pageY : e.pageY;

  offset.left = container.offsetLeft;
  offset.top = container.offsetTop;

  while (ref) {
    offset.left += ref.offsetLeft;
    offset.top += ref.offsetTop;

    ref = ref.offsetParent;
  }

  return {
    x: pos.x - offset.left,
    y: pos.y - offset.top,
  };
}
