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
    getUsers(context) {
      return new Promise(resolve => {
        if (context.state.users.length) {
          resolve(context.state.users);
        } else {
          context.dispatch('getMoreUsers').then(users => resolve(users));
        }
      })
    },
    getMoreUsers(context) {
      return new Promise(resolve => {
        fetch(`http://localhost:3000/api/users?from=${context.state.from}&to=${context.state.to}`)
            .then(res => res.json())
            .then(users => {
              for (const user of users) {
                if (!_.find(context.state.users, {'login': user.login})) {
                  context.commit('addUser', user);
                }
              }
              context.state.from += users.length > 0 ? 5 : 0;
              resolve(context.state.users);
            })
            .catch(() => {
              if (!context.state.users) {
                resolve([]);
              } else {
                resolve(context.state.users);
              }
            });
      })

    },
    getUser(context, { login }) {
      return new Promise(resolve => {
        let storeUser = _.find(context.state.users, { login });
        if (storeUser && storeUser['email']) {
          resolve(storeUser)
        } else {
          fetch('http://localhost:3000/api/user/' + login)
              .then(res => res.json())
              .then(user => {
                if (storeUser) {
                  context.commit('changeUser', { login, newUser: user });
                } else {
                  context.commit('addUser', user);
                }
                resolve(user);
              })
              .catch(() => resolve({ }) );
        }
      });
    },
    updateUser(context, { login, updatedUser }) {
      return new Promise((resolve, reject) => {
        if (!login || !updatedUser.email || !updatedUser.password) {
          return reject('400');
        }
        fetch('http://localhost:3000/api/user/' + login, {
          method: 'put',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: JSON.stringify(updatedUser)
        })
            .then((res) => {
              if (res.status !== 200) {
                throw new Error(res.status + '');
              }
              context.commit('changeUser', { login, newUser: updatedUser });
              resolve();
            })
            .catch(e => reject(e.message));
      });
    },
    createUser(context, { login, newUser }) {
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
