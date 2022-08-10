<template>
  <Button
    :material="'opacity: 1.0; transparent: false'"
    :textColor="'black'"
    :text-value="text"
    :row="row"
    :of="of"
    :slice-text="false"
    :clickable="false"
  />
</template>

<script>
import Button from './Button'
export default {
  components: {
    Button
  },
  props: {
    text: {
      type: String,
      required: true
    },
    of: {
      type: Number,
      required: true
    },
    row: {
      type: Number,
      required: true
    }
  }
}
</script>
