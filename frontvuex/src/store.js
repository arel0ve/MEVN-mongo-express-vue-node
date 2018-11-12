import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: [],
    from: 0,
    to: 5
  },
  mutations: {
    addUser(state, newUser) {
      state.users.push(newUser)
    },
    changeUser(state, { login, newUser }) {
      _.pullAllBy(state.users, [{login}], 'login');
      state.users.push(_.assign({login}, newUser));
    },
    deleteUser(state, { login }) {
      _.pullAllBy(state.users, [{login}], 'login');
    },
  },
  actions: {
    async getUsers(context) {
      if (context.state.users.length) {
        return context.state.users;
      } else {
        return await context.dispatch('getMoreUsers');
      }
    },
    async getMoreUsers(context) {
      try {
        const res = await fetch(`http://localhost:3000/api/users?from=${context.state.from}&to=${context.state.to}`);
        const users = await res.json();
        for (const user of users) {
          if (!_.find(context.state.users, {'login': user.login})) {
            context.commit('addUser', user);
          }
        }
        context.state.from += users.length > 0 ? 5 : 0;
        return context.state.users;
      } catch (e) {
        console.error(e);
        return context.state.users ? context.state.users : [];
      }
    },
    async getUser(context, { login }) {
      try {
        let storeUser = _.find(context.state.users, { login });
        if (storeUser && storeUser['email']) {
          return storeUser;
        } else {
          const res = await fetch('http://localhost:3000/api/user/' + login);
          const user = await res.json();
          if (storeUser) {
            context.commit('changeUser', { login, newUser: user });
          } else {
            context.commit('addUser', user);
          }
          return user;
        }
      } catch (e) {
        console.error(e);
        return {
          login: 'Not Found'
        };
      }
    },
    async updateUser(context, { login, updatedUser }) {
      try {
        if (!login || !updatedUser.email || !updatedUser.password) {
          throw new Error('400');
        }
        const res = await fetch('http://localhost:3000/api/user/' + login, {
          method: 'put',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: JSON.stringify(updatedUser)
        });

        if (res.status !== 200) {
          throw new Error(res.status + '');
        }
        context.commit('changeUser', { login, newUser: updatedUser });
        return 'Ok!';
      } catch (e) {
        console.error(e);
        throw new Error(e);
      }
    },
    async createUser(context, { login, newUser }) {
      if (!login || !newUser.email || !newUser.password) {
        throw new Error('400');
      }
      if (_.find(context.state.users, { login })) {
        return reject('404');
      }
      return new Promise((resolve, reject) => {
        if (!login || !newUser.email || !newUser.password) {
          return reject('400');
        }
        if (_.find(context.state.users, { login })) {
          return reject('404');
        }
        fetch('http://localhost:3000/api/user/', {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: JSON.stringify(newUser)
        })
            .then((res) => {
              if (res.status !== 200) {
                throw new Error(res.status + '');
              }
              context.commit('addUser', newUser);
              resolve();
            })
            .catch(e => reject(e.message));
      });
    },
    deleteUser(context, { login }) {
      return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/api/user/${login}`, {
            method: 'delete',
            headers: new Headers({
              'Content-Type': 'application/x-www-form-urlencoded'
            })
        })
            .then(res => res.json())
            .then(user => {
              context.commit('deleteUser', { login: user['login'] });
              resolve(context.state.users);
            })
            .catch(e => reject(e.message));
      });
    },
  },
});
