---
layout: page
title: "Puzzles"
permalink: /puzzles/
---
  You are given some vases, each with a color and a shape. If you have at least one pair with a different color and at least one pair with a different shape do you necessarily have a pair of vases which have a different color and different shape?

  <details>
    <summary>Solution</summary>
    Yes.

    Suppose the colors of the vases are  $c_1, ..., c_n$ and the shapes are $s_1, ..., s_n$. Also suppose that the first pair of vases, vases 1 and 2, have a different color. Also, the second pair of vases, vases 3 and 4, have a different shape.

    If vase 1 and vase 3 have a different shape or vase 1 and vase 4 has a different shape, then we already have two vases with a different color and shape, because we know vase 1 and vase 2 have a different color.

    The other option is vase 1 and vase 3 have the same shape and vase 1 and vase 4 have the same shape, which implies that vase 3 and vase 4 have the same shape, which is a contradiction.
  </details>