<template>
  <a-entity>
    <Tooltip
      :text="'U hebt dit scenario afgerond, goed gedaan!\n U kunt nu door naar het volgende scenario.'"
      :row="1"
      :of="2"
    />

    <Button
      text-value="Doorgaan"
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
