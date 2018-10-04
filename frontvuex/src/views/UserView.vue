<template>
  <table class="table table-striped">
    <thead>
      <tr>
        <th scope="col">&nbsp;</th>
        <th scope="col">Field</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="col">#</th>
        <td>Current user:</td>
        <td>
          <router-link :to="$route.params.login">{{ user.login }}</router-link>
        </td>
      </tr>
      <tr v-for="(val, key, index) in user">
        <th scope="col">{{ index }}</th>
        <td>{{ key }}:</td>
        <td>{{ val }}</td>
      </tr>
      <tr>
        <th scope="col">#</th>
        <td>
          <router-link :to="'../' + 'edit/' + $route.params.login">Edit user</router-link>
        </td>
        <td>
          <router-link to="../index">Back</router-link>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'userView',
  data() {
    return {
      user: {}
    }
  },
  created() {
    this.$store.dispatch('getUser', {login: this.$route.params.login})
        .then(user => this.user = user);
  }
};
</script>
