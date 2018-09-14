import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Header extends Component {
  render() {
    return (
      <header>
        <Link
          to="/"
          data-activates="slide-out"
          class="btn btn-primary p-3 button-collapse"
        >
          <i className="fa fa-bars" />
        </Link>

        <div className="side-nav fixed" id="slide-out">
          <ul className="custom-scrollbar">
            <li>
              <div className="logo-wrapper waves-light">
                <Link className="img-fluid fex-center" to="!#" />
              </div>
            </li>
            <li>
              <ul className="social">
                <li>
                  <Link to="!#" className="icons-sm fb-ic">
                    <i className="fa fa-facebook" />
                  </Link>
                </li>
                <li>
                  <Link to="!#" className="icons-sm pin-ic">
                    <i className="fa fa-pinterest" />
                  </Link>
                </li>
                <li>
                  <Link to="!#" className="icons-sm gplus-ic">
                    <i className="fa fa-google-plus" />
                  </Link>
                </li>
                <li>
                  <Link to="!#" className="icons-sm tw-ic">
                    <i className="fa fa-twitter" />
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <form action="" role="search" className="search-form">
                <div className="md-form my-0 waves-light">
                  <input
                    type="text"
                    className="form-control py-2"
                    placeholder="Search"
                  />
                </div>
              </form>
            </li>
            <ul className="collapsible collapsible-accordion">
              <li>
                <Link
                  className="collapsible-header waves-effect arrow-r"
                  to="!#"
                >
                  <i className="fa fa-chevron-right" /> Submit Blob{" "}
                  <i className="fa fa-angle-down rotate-icon" />{" "}
                </Link>
                <div className="collapsible-body">
                  <ul>
                    <li>
                      <Link to="!#" className="waves-effect">
                        View
                      </Link>{" "}
                    </li>
                    <li>
                      <Link to="!#" className="waves-effect">
                        Register
                      </Link>{" "}
                    </li>
                  </ul>
                </div>
              </li>
              <li>
                <Link
                  className="collapsible-header waves-effect arrow-r"
                  to="!#"
                >
                  <i className="fa fa-chevron-right" /> Submit Blob{" "}
                  <i className="fa fa-angle-down rotate-icon" />{" "}
                </Link>
                <div className="collapsible-body">
                  <ul>
                    <li>
                      <Link to="!#" className="waves-effect">
                        View
                      </Link>{" "}
                    </li>
                    <li>
                      <Link to="!#" className="waves-effect">
                        Register
                      </Link>{" "}
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </ul>
        </div>
      </header>
    );
  }
}
