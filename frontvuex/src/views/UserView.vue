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
          <router-link :to="$route.params['login']">{{ user.login }}</router-link>
        </td>
      </tr>
      <tr v-for="(val, key, index) in user" v-if="key !== 'friends'">
        <th scope="col">{{ index }}</th>
        <td>{{ key }}:</td>
        <td>{{ val }}</td>
      </tr>
      <tr>
        <th scope="col">{{ Object.keys(user).length - 1 }}</th>
        <td>friends:</td>
        <td>
          <div v-for="val of user.friends">{{ val }}</div>
        </td>
      </tr>
      <tr>
        <th scope="col">#</th>
        <td>
          <router-link :to="'../' + 'edit/' + $route.params['login']">Edit user</router-link>
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
      user: {},
    };
  },
  async created() {
    this.user = await this.$store.dispatch('getUser', { login: this.$route.params['login'] });
    this.user.country = this.user.country.toUpperCase();
    if (this.user.birthday) {
      this.user.birthday = new Date(this.user.birthday).toDateString();
    }
  },
};
</script>
