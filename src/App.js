import React, { Component, Fragment } from "react";
import request from "superagent"
import "./App.css";
    
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      hasMore: true,
      isLoading: false,
      page: 1,
      photos: []
    };
  }
  componentWillMount() {
    this.loadUsers()
  }

  componentDidMount() {
    // Detect when scrolled to bottom.
    this.refs.myscroll.addEventListener("scroll", () => {
      if (
        this.refs.myscroll.scrollTop + this.refs.myscroll.clientHeight >=
        this.refs.myscroll.scrollHeight && !this.state.isLoading
      ) {
        this.loadUsers();
        console.log('loadUsers() called from event listener in componentDidMount()');
      }
    });
  }

  loadUsers() {
    const encodedToken = btoa(unescape(encodeURIComponent('4iPxzSjRbGsHBVWMm8nq5KG_ooiYlxvkvfkm:')))
    this.setState({ isLoading: true }, () => {
      request
        .get(`https://gorest.co.in/public-api/photos?page=${this.state.page}`)
        .set('Authorization', 'Basic ' + encodedToken)
        .then((results) => {
          // Creates a massaged array of photo data
          const nextPhotos = results.body.result.map(photo => ({
            id: photo.id,
            title: photo.title,
            url: photo.url,
          }));

          // Merges the next photos into our existing photos
          this.setState({
            hasMore: (this.state.photos.length < 100),
            isLoading: false,
            page: this.state.page + 1,
            photos: [
              ...this.state.photos,
              ...nextPhotos,
            ],
          });
          console.log('Current page number set when promise resolved from API call:', this.state.page);
        })
        .catch((err) => {
          this.setState({
            error: err.message,
            isLoading: false,
            });
        })
    });
  }

  render() {
    console.log("re-render");
    const {
      error,
      hasMore,
      isLoading,
      photos,
    } = this.state;
    return (
      <div
        className="App"
        ref="myscroll"
        style={{ height: "500px", overflow: "auto" }}
      >
        {photos.map(photo => (
          <Fragment key={photo.id}>
            <div style={{ display: 'flex' }}>
              <img
                alt={photo.title}
                src={photo.url}
                style={{
                  borderRadius: '10px',
                  height: 100,
                  margin: 20,
                  width: 100,
                }}
              />
              <div style={{ width: 200 }}>
                <h5 style={{ marginTop: 0 }}>
                  Photo No. {photo.id}
                </h5>
                <h6>Caption: {photo.title}</h6>
              </div>
            </div>
          </Fragment>
        ))}
        {error &&
          <div style={{ color: '#900' }}>
            {error}
          </div>
        }
        {isLoading &&
          <div>Loading...</div>
        }
        {!hasMore &&
          <div>You did it! You reached the end!</div>
        }
      </div>
    );
  }
}
    
export default App;