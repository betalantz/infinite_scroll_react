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
      startPage: 1,
      endPage: 1,
      photos: []
    };
  }
  componentWillMount() {
    this.loadPhotosBottom()
  }

  componentDidMount() {
    // Detect when scrolled to bottom.
    this.refs.myscroll.addEventListener("scroll", () => {
      if (
        this.refs.myscroll.scrollTop + this.refs.myscroll.clientHeight >=
        this.refs.myscroll.scrollHeight && !this.state.isLoading
      ) {
        this.loadPhotosBottom();
        console.log('loadPhotos() called from event listener in componentDidMount()');
      }
      if (
        !this.refs.myscroll.scrollTop && this.refs.myscroll.clientHeight <
        this.refs.myscroll.scrollHeight && !this.state.isLoading
      ) {
        this.loadPhotosTop();
        console.log('hitting top of scroll');
      }
    });
  }

  loadPhotosBottom() {
    const encodedToken = btoa(unescape(encodeURIComponent('4iPxzSjRbGsHBVWMm8nq5KG_ooiYlxvkvfkm:')))
    this.setState({ isLoading: true }, () => {
      request
        .get(`https://gorest.co.in/public-api/photos?page=${this.state.endPage}`)
        .set('Authorization', 'Basic ' + encodedToken)
        .then((results) => {
          // Creates a massaged array of photo data
          const nextPhotos = results.body.result.map(photo => ({
            id: photo.id,
            title: photo.title,
            url: photo.url,
          }));
          let currPhotos = this.state.photos
          if (currPhotos.length >= 80) {
            currPhotos.splice(0, 20)
            this.setState({ startPage: this.state.startPage + 1 })
            console.log('front photos removed; photos.length:', this.state.photos.length);
            console.log('startPage renumbered: ', this.state.startPage);
          }
          // Merges the next photos into our existing photos
          this.setState({
            hasMore: (this.state.photos.length < 100),
            isLoading: false,
            endPage: this.state.endPage + 1,
            photos: [
              ...currPhotos,
              ...nextPhotos,
            ],
          });
          console.log('Current end page number set when promise resolved from API call:', this.state.endPage);
        })
        .catch((err) => {
          this.setState({
            error: err.message,
            isLoading: false,
            });
        })
    });
  }

  /* TODO: This implementation is not very DRY 
  need to refactor, perhaps by breaking out helper functions
  there may be too many re-renders triggered by state changes; try to optimize load times*/
  loadPhotosTop() {
    const encodedToken = btoa(unescape(encodeURIComponent('4iPxzSjRbGsHBVWMm8nq5KG_ooiYlxvkvfkm:')))
    const prevPage = this.state.startPage - 1
    this.setState({ isLoading: true }, () => {
      request
        .get(`https://gorest.co.in/public-api/photos?page=${prevPage}`)
        .set('Authorization', 'Basic ' + encodedToken)
        .then((results) => {
          // Creates a massaged array of photo data
          const nextPhotos = results.body.result.map(photo => ({
            id: photo.id,
            title: photo.title,
            url: photo.url,
          }));
          let currPhotos = this.state.photos
          if (currPhotos.length >= 80) {
            currPhotos.splice(60)
            this.setState({ endPage: this.endPage - 1 })
            console.log('end photos removed; photos.length:', this.state.photos.length);
          }
          // Merges the next photos into our existing photos
          this.setState({
            hasMore: (this.state.photos.length < 100),
            isLoading: false,
            startPage: this.state.startPage - 1,
            photos: [
              ...nextPhotos,
              ...currPhotos,
            ],
          });
          console.log('Current start page number set when promise resolved from API call:', this.state.startPage);
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