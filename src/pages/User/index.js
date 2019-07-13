import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Load,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    // eslint-disable-next-line react/no-unused-state
    loading: false,
    page: 1,
    refreshing: false,
    // eslint-disable-next-line react/no-unused-state
    count: 0,
  };

  // eslint-disable-next-line react/sort-comp
  handlePage = async () => {
    const { page, count } = this.state;
    await this.setState({ page: page + 1 });
    if (count > 19) {
      this.componentDidMount();
    }
  };

  refreshList = async () => {
    await this.setState({ refreshing: true, page: 1 });
    this.componentDidMount();
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const { page } = this.state;
    this.setState({ loading: true });
    const user = navigation.getParam('user');

    const response = await api.get(`users/${user.login}/starred`, {
      params: {
        per_page: 20,
        page,
      },
    });

    this.setState({
      stars: response.data,
      loading: false,
      refreshing: false,
      count: response.data.length,
    });
  }

  handleNavigate = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <Load>
            <ActivityIndicator color="#eee" size={90} />
          </Load>
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
            onEndReachedThreshold={0.2}
            onEndReached={this.handlePage}
            onRefresh={this.refreshList}
            refreshing={refreshing}
          />
        )}
      </Container>
    );
  }
}
