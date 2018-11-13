<template>
  <div class="container">
      <div class="row" v-for="user of users">
        <div class="col-6">{{ user.login }}</div>
        <div class="col-2">
          <router-link :to="'user/' + user.login">view</router-link>
        </div>
        <div class="col-2">
          <router-link :to="'edit/' + user.login">edit</router-link>
        </div>
        <div class="col-2">
          <span class="delete" @click="deleteUser(user.login)">X</span>
        </div>
      </div>
    <div class="row justify-content-center border-top border-info">
      <div class="col-6 col-md-4" v-if="existsMoreUsers" style="padding: 12px 0;">
        <button class="btn btn-primary col-10" @click="getMoreUsers">Show more users</button>
      </div>
      <div class="col-6 col-md-4" style="padding: 12px 0;">
        <button class="btn btn-primary col-10" @click="reload">Reload</button>
      </div>
      <div class="col-6 col-md-4" style="padding: 12px 0;">
        <router-link to="../create">
          <button class="btn btn-primary col-10">Create new user</button>
        </router-link>
      </div>
    </div>
    <div class="row alert alert-danger" v-if="errMessage.length > 0">
      <div class="col">{{ errMessage }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsersList',
  data() {
    return {
      users: [],
      existsMoreUsers: true,
      errMessage: ''
    }
  },
  async created() {
    this.users = await this.$store.dispatch('getUsers');
    if (this.users.length === 0) {
      this.errMessage = "There are not any users in user's list. Please, try again later"
    }
  },
  methods: {
    async getMoreUsers() {
      const oldLength = this.users.length;
      this.users = await this.$store.dispatch('getMoreUsers', {});
      if (this.users.length === oldLength) {
        this.existsMoreUsers = false;
      }
    },
    async reload() {
      this.users = await this.$store.dispatch('reload', {});
      if (this.users.length === 0) {
        this.errMessage = "There are not any users in user's list. Please, try again later"
      }
    },
    async deleteUser(login) {
      const res = await this.$store.dispatch('deleteUser', { login });
      if (typeof res === 'object' && res !== null) {
        this.users = res;
        if (this.users.length === 0) {
          this.errMessage = "There are not any users in user's list. Please, try again later"
        }
      } else {
        this.errMessage = "Something bad on server. Please, try again later";
      }
      await this.reload();
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
  &:hover {
    color: #4283b9;
  }
}
.delete {
  cursor: pointer;
  color: #b94283;
  &:hover {
    color: #4283b9;
    text-decoration: underline;
  }
}
</style>
