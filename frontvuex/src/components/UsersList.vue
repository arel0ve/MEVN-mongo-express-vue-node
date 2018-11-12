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
    <div class="row justify-content-end border-top border-info" style="padding: 12px 0;">
      <div class="col-6" v-if="existsMoreUsers">
        <button class="btn btn-primary" @click="getMoreUsers">Show more users</button>
      </div>
      <div class="col-6">
        <router-link to="../create">
          <button class="btn btn-primary">Create new user</button>
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
  created() {
    this.$store.dispatch('getUsers')
        .then(users => {
          this.users = users;
          if (this.users.length === 0) {
            this.errMessage = "There are not any users in user's list. Please, try again later"
          }
        });
  },
  methods: {
    getMoreUsers() {
      this.$store.dispatch('getMoreUsers')
          .then(users => {
            if (users.length === this.users.length) {
              this.existsMoreUsers = false;
            }
            this.users = users;
          });
    },
    deleteUser(login) {
      this.$store.dispatch('deleteUser', { login })
          .then(users => {
            this.users = users;
            if (this.users.length === 0) {
              this.errMessage = "There are not any users in user's list. Please, try again later"
            }
          })
          .catch(() => {
            this.errMessage = "Something bad on server. Please, try again later";
            setTimeout(() => {
              this.errMessage = "";
            }, 3000)
          });
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
