<template>
  <UsersList/>
</template>

<script>
// @ is an alias to /src
import UsersList from '@/components/UsersList.vue';

export default {
  name: 'home',
  components: {
    UsersList,
  },
};
</script>
