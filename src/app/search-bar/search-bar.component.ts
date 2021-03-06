import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { HashService } from '../services/hash.service';
import { ScriptService } from '../services/script.service';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';


@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {

  myForm: FormGroup;
  username: string = '';
  postForm: FormGroup;
  hashForm: FormGroup;
  hashButton: boolean = false;
  postButton: boolean = false;
  userButton: boolean = false;
  tweets: any;

  constructor(private scriptService: ScriptService, private elementRef: ElementRef, private sanitizer: DomSanitizer, private postService: PostService, private http: Http, private hashService: HashService, private userService: UserService, private fb: FormBuilder) { 
    this.myForm = fb.group({
      'username': null
    })
    this.postForm = fb.group({
      'post': null
    })
    this.hashForm = fb.group({
      'hash': null
    })

    this.tweets = [];
  }



  toggleQuery(value: any) {
    if (value === 'Hashes') {
      this.postButton = false;
      this.userButton = false;
      this.hashButton = true;
    } 
    if (value === 'Posts') {
      this.postButton = true;
      this.userButton = false;
      this.hashButton = false;      
    }
    if (value === 'People') {
      this.postButton = false;
      this.userButton = true;
      this.hashButton = false; 
    }
  }

  searchUsers(query) {
    console.log(query)
    this.userService.getUser(query)
    this.myForm.reset();
  } 

  searchHashTags(query) {
    console.log(query)
    this.hashService.getHash(query)
    this.hashForm.reset();
  }
  
  searchPosts(query) {
    this.tweets = [];
    // console.log(query, 'this is from searchbar')
    this.postService.getTwitch(query.post)
    this.postService.getYouTube(query.post)
    this.postService.getTwitter(query.post)
    .subscribe((data) => {
      // console.log(data, 'this s in the search bar componebt')
      // this.tweets = data;
      for (var i = 0; i < data.length; i++) {
        this.postService.getEmbed(data[i])
        .subscribe((data) => {
          var el = document.createElement('html');
          el.innerHTML = data;
          console.log(el, 'fraaag') 
          var twt = this.sanitizer.bypassSecurityTrustHtml(el.innerHTML);          
          this.tweets.push(twt);
          this.scriptService.load('twitterWidget')
          .then(data => {
            console.log('script loaded ', data);
          })
          .catch(error => console.log(error));    
        })
      }
    }, (err) => {
      console.log(err, 'error from searchPosts')
    })
    this.postForm.reset();
  }
  
  auth() {
    this.http.get('http://localhost:4201/auth')
    .subscribe((data) => {
      console.log(data)
      for (var key in data) {
        if (typeof data[key] === 'string') {
          if (data[key].length > 50) {
            console.log(JSON.parse(data[key]).data)
            localStorage.setItem('bearerToken', JSON.parse(data[key]).data)
          }
        }
      }
    }, (err) => {
      console.log(err)
    })
  }
  //toggle between search bars
  //one search bar to search for users
  
  //one search bar to search for hashtags
  
  //one search bar to search for posts
  
  createDiv(node_name,textElement) {
    var _nodeElement = document.createElement(node_name);
    _nodeElement.innerHTML = textElement;
    return _nodeElement;
  }
  
  ngOnInit() {
  }
}
