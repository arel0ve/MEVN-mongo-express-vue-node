<template>
  <div class="container">
      <div class="row" v-for="user of users">
        <div class="col-6">{{ user.login }}</div>
        <div class="col-3"><router-link :to="'user/' + user.login">view</router-link></div>
        <div class="col-3"><router-link :to="'edit/' + user.login">edit</router-link></div>
      </div>
    <div class="row justify-content-end border-top">
      <div class="col-6">
        <router-link to="../create">Create new user</router-link>
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
      errMessage: ''
    }
  },
  created() {
    fetch('http://localhost:3000/api/users')
        .then((res) => res.json())
        .then((users) => this.users = users)
        .catch(() => this.errMessage = "Can't load list of users. Please, try again later");
  }
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
}
</style>
