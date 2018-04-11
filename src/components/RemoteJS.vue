<template>
 <div>XXXXXXXX</div>
</template>

<script>
    export default {
        name: "RemoteJS",
        render(createElement) {
            return createElement('script', {attrs: {type: 'text/javascript', src: this.src}});
        },
        props: {
            src: {type: String, required: true},
        },
    }
</script>

<style scoped>

</style>