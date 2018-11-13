import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: [],
    from: 0,
    count: 5
  },
  mutations: {
    addUser(state, newUser) {
      state.users.push(newUser)
    },
    changeUser(state, { login, newUser }) {
      const i = _.findIndex(state.users, {'login': login});
      state.users[i] = _.assign({login}, newUser);
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
        return await context.dispatch('getMoreUsers', {});
      }
    },
    async reload(context) {
      context.state.users = [];
      return await context.dispatch('getMoreUsers', {
        from: 0,
        to: context.state.from,
        isReload: true
      });
    },
    async getMoreUsers(context, {from, to, isReload}) {
      try {
        from = (from !== undefined) ? from : context.state.from;
        to = to ? to : (context.state.count + from);
        isReload = !!isReload;
        const res = await fetch(`http://localhost:3000/api/users?from=${from}&to=${to}`);
        const users = await res.json();
        for (const user of users) {
          if (!_.find(context.state.users, {'login': user.login})) {
            context.commit('addUser', user);
          }
        }
        context.state.from += (users.length > 0 && !isReload) ? 5 : 0;
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
        console.log(res.status);
        if (res.status !== 200) {
          throw new Error(res.status + '');
        }
        context.commit('changeUser', { login, newUser: updatedUser });
        return '200';
      } catch (e) {
        console.error(e);
        return e + '';
      }
    },
    async createUser(context, { login, newUser }) {
      try {
        if (!login || !newUser.email || !newUser.password) {
          throw new Error('400');
        }
        if (_.find(context.state.users, { login })) {
          throw new Error('404');
        }
        const res = await fetch('http://localhost:3000/api/user/', {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: JSON.stringify(newUser)
        });
        if (res.status !== 200) {
          throw new Error(res.status + '');
        }
        context.commit('addUser', newUser);
        return('200');
      } catch (e) {
        console.error(e);
        return e + '';
      }
    },
    async deleteUser(context, { login }) {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${login}`, {
          method: 'delete',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        });
        const user = await res.json();
        context.commit('deleteUser', { login: user['login'] });
        return context.state.users;
      } catch (e) {
        return e + ''
      }
    },
  },
});
