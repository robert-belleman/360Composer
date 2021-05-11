<template>
  <a-entity>
    <Tooltip
      :text="'PCIT-VR training\nkijk naar \'Start\' om te beginnen'"
      :row="1"
      :of="2"
    />

    <Button
      :background-color="'#00d945'"
      text-value="Start"
      :row="2"
      :of="2"
      @click="$emit('click')"
    />
  </a-entity>
</template>

<script>
import Button from './Button'
import Tooltip from './Tooltip'

export default {
  components: {
    Button,
    Tooltip
  }
}
</script>
