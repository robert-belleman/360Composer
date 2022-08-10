<template>
  <a-entity>
    <Tooltip
      :text="'U hebt deze video afgerond, goed gedaan!\nU kunt nu terug naar het hoofdmenu.'"
      :row="1"
      :of="2"
    />

    <Button
      :background-color="'#00d945'"
      text-value="Naar hoofdmenu"
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
