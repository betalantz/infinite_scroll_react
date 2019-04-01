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
      isTop: false,
      endPage: 1,
      photos: []
    };
  }
  componentWillMount() {
    this.loadPhotos()
  }

  componentDidMount() {
    // Detect when scrolled to bottom.
    this.refs.myscroll.addEventListener("scroll", () => {
      if (
        this.refs.myscroll.scrollTop + this.refs.myscroll.clientHeight >=
        this.refs.myscroll.scrollHeight && !this.state.isLoading
      ) {
        this.setState({ isTop: false })
        this.loadPhotos();
      }
      if (
        !this.refs.myscroll.scrollTop && this.refs.myscroll.clientHeight <
        this.refs.myscroll.scrollHeight && !this.state.isLoading
      ) {
        this.setState({ isTop: true })
        this.loadPhotos();
      }
    });
  }

  loadPhotos() {
    const { isTop, endPage, photos } = this.state
    const encodedToken = btoa(unescape(encodeURIComponent('4iPxzSjRbGsHBVWMm8nq5KG_ooiYlxvkvfkm:')))
    const loadPage = isTop ? endPage - 4 : endPage + 1
    console.log('loadPage: ', loadPage);
    this.setState({ isLoading: true }, () => {
      request
        .get(`https://gorest.co.in/public-api/photos?page=${loadPage}`)
        .set('Authorization', 'Basic ' + encodedToken)
        .then((results) => {
          // Creates a structured array of photo data
          const nextPhotos = results.body.result.map(photo => ({
            id: photo.id,
            title: photo.title,
            url: photo.url,
          }));
          let currPhotos = photos
          let newPhotos, newEndPage
          if (!isTop) {
            if (currPhotos.length >= 80) {
              currPhotos.splice(0, 20)
            }
            newPhotos = [
              ...currPhotos,
              ...nextPhotos]
            newEndPage = endPage + 1
          } else if (isTop) {
            if (currPhotos.length >= 80) {
              currPhotos.splice(60)
              newPhotos = [
              ...nextPhotos,
              ...currPhotos
            ]
            newEndPage = endPage - 1
            } else {
              newPhotos = [...currPhotos]
              newEndPage = endPage
            }
            
          }
          console.log('newEndPage: ', newEndPage);
          // Merges the next photos into our existing photos
          this.setState({
            hasMore: (results.body._meta.currentPage < results.body._meta.pageCount),
            isLoading: false,
            endPage: newEndPage,
            photos: [...newPhotos],
          });
        })
        .catch((err) => {
          this.setState({
            error: err.message,
            isLoading: false,
            });
        })
    });
  }
/* TODO: 
Set App div height = window height
make sure render times are optimized */
  render() {
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
          <div>No more photos to display...</div>
        }
      </div>
    );
  }
}
    
export default App;