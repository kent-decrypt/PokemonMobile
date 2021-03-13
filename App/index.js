import React, { useState, useCallback, Component } from 'react';
import { Picker, RefreshControl, SafeAreaView, ScrollView, StyleSheet, FlatList, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { getPokemons } from './services/api.connection';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedType: "default",
      loading: true,
      nextUrl: null,
      displayedPokemons: [],
      pokemonList: []
    };

  }

  async onRefresh() {
    this.setState({ loading: true, selectedType: "default" });
    await this.setPokemons();
  }

  async getNextList() {
    await this.setPokemons(true);
  }

  async setPokemons(isUpdate = false) {
    this.setState({ loading: true });

    const { nextUrl, pokemonList, displayedPokemons } = this.state;

    const pokemonApi = await getPokemons(isUpdate ? nextUrl : null);
    const { count: pokemonCount, next: newNextUrl, results } = pokemonApi;
    
    const newPokemonList = results.map((pokemon) => { 
      const { name, } = pokemon;
      return { name: upperCaseFirstChar(name), }
    });

    const newPokemonFilteredList = results.map((pokemon, index) => { 
      const { name, } = pokemon;

      switch(this.state.selectedType) {
        case "upgrade":
          return { name: `${upperCaseFirstChar(name)} Upgraded` };

        case "ultimate":
            return { name: index < 20 ? `${upperCaseFirstChar(name)} Upgraded` : upperCaseFirstChar(name) };

        case "imposters":
          return { name: pokemon.name.charAt(0) === "A" ? pokemon.name : undefined }
        
        case "default":
        default:
          return { name: upperCaseFirstChar(name), }
      }

    }).filter(pokemon => pokemon.name !== undefined);

    if(pokemonCount <= 0) return alert("No Pokemon data retrieved!");

    this.setState({ 
      pokemonList: isUpdate ? [...pokemonList, ...newPokemonList] : newPokemonList, 
      displayedPokemons: isUpdate ? [...displayedPokemons, ...newPokemonFilteredList] : newPokemonFilteredList, 
      loading: false, 
      nextUrl: newNextUrl
    });
  }

  async setSelectedType(itemValue, itemIndex) {
    this.setState({ selectedType: itemValue, });

    switch(itemValue) {
      case "upgrade":
        const upgradedPokemonList = this.state.pokemonList.map(pokemon => {
          return { name: `${pokemon.name} Upgraded` };
        });
        this.setState({ displayedPokemons: upgradedPokemonList });
        break;

      case "imposters":
        const impostersPokemonList = this.state.pokemonList.filter(pokemon => pokemon.name.charAt(0) === "A");
        this.setState({ displayedPokemons: impostersPokemonList });
        break;

      case "ultimate":
        const ultimatePokemonList = this.state.pokemonList.map((pokemon, index) => {
          return {
            name: index < 20 ? `${pokemon.name} Upgraded` : pokemon.name
          }
        });
        this.setState({ displayedPokemons: ultimatePokemonList });
        break;
      
      case "default":
      default:
        await this.setPokemons();
        break;
    }

  }

  async componentDidMount() {
    await this.setPokemons();
  }

  renderPokemon(data) {
    const { name } = data.item;

    return(
      <TouchableOpacity style={styles.pokemonView}>
        <View>
          <Text>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return(
      <SafeAreaView style={styles.container}>
        <ActivityIndicator 
          animating={this.state.loading}
        />
        <Picker
          selectedValue={this.state.selectedType}
          style={styles.pickerStyle}
          onValueChange={(value, index) => this.setSelectedType(value, index)}
        >
          <Picker.Item label="Default" value="default" />
          <Picker.Item label="Upgrade" value="upgrade" />
          <Picker.Item label="Imposters" value="imposters" />
          <Picker.Item label="Ultimate" value="ultimate" />
        </Picker>
        <View>
          <FlatList 
            refreshing={this.state.loading}
            onRefresh={_ => this.onRefresh()}
            data={this.state.displayedPokemons}
            renderItem={this.renderPokemon}
            keyExtractor={item => item.name}
            onEndReached={(info) => this.getNextList(info)}
            onEndReachedThreshold={0.5}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const upperCaseFirstChar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerStyle: {
    margin: 0,
    height: 50,
    width: 150,
    alignItems: 'flex-start'
  },
  pokemonView: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#CCC',
    width: 450
  }
});

export default App;