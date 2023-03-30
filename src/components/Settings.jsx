import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {

    const [subscriptionData, setSubscriptionData] = useState({});
    const [cors_status, setCors] = useState('');
    const [sub_id, setSubid] = useState('');
    const [loader, setLoader] = useState('Save Settings');
    // let check = 'checked';

    const url = `${appLocalizer.apiUrl}/wooventory/v1/settings`;
    const changeLogUrl = 'https://wooventory.com/wp-json/wp/v2/changelog';

    // const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoader('Saving...');
        axios.post(url, {
            cors_status: cors_status,
            sub_id: sub_id
        }, {
            headers: {
                'content-type': 'application/json',
                'X-WP-NONCE': appLocalizer.nonce
            }
        })
            .then((res) => {
                getSubscription(sub_id);
                setLoader('Save Settings');
            })
    }

    const getSubscription = (sub_id) => {
        if (sub_id != null && sub_id != "") {
            var subscriptionUrl = `${appLocalizer.apiUrl}/wooventory/v1/subscription/` + sub_id;

            axios.get(subscriptionUrl)
                .then((res) => {
                    if (res.status === 200) {
                        setSubscriptionData(res.data);
                    }
                }).catch((error) => console.log(error));
        }
    }

    useEffect(() => {
        axios.get(url)
            .then((res) => {
                setCors(res.data.cors_status);
                setSubid(res.data.sub_id);
                getSubscription(res.data.sub_id);
            });

        // if(cors_status != true){
        //     check = '';
        // }

    }, []);

    const showMessage = () => {
        return <div className='inactive-widget'> Please enter your subscription ID to receive support  </div>
    }

const showList = () => {
    let appsArray = subscriptionData ? subscriptionData.fee_lines : null ;
    let list="";
    if(appsArray != null){
        list = appsArray.map( (s)=> {
            return <li> - {s.name} </li>
        });
        return list;
    }
}

    const renderWidget = () => {
        let lineItems = subscriptionData.line_items ? subscriptionData.line_items[0] : null;
        let paymentCurrency = subscriptionData.currency;
        return <div className='main'>
            <div className='content'>
                <div>
                    <h1> {lineItems != null ? lineItems.name : "Loading..." }  </h1>
                    <p>
                        Live Notifications, Fastest IOS/Android App, Staff Members, Integrations and more
                    </p>

                    <h3> Activated Integrations </h3>
                    <ul>
                        {showList()}
                    </ul>

                    <a href='https://wooventory.com/pricing'>
                        View Plans
                    </a>
                    {subscriptionData.needs_payment == true ?
                        <a href={subscriptionData.payment_url} target="_blank" className="right rplan-btn"> Reactivate Plan </a>
                        : null}
                </div>
            </div>
            <div className="footer">
                Payment
                <p> Your next bill is for {subscriptionData.total} {paymentCurrency} on {subscriptionData.next_payment_date_gmt} </p>
            </div>
        </div >
    }


    return (
        <React.Fragment>
            <div className='dashboard-container'>

                <div className="leftside">
                    <div className="setting-card">
                        <div className="head"> Settings </div>

                        <form id="work-settings-form" onSubmit={(e) => handleSubmit(e)}>
                            <div className='content'>
                                <table className="form-table" role="presentation">
                                    <tbody>
                                        <tr>
                                            <th scope="row">
                                                <label htmlFor="cors_status"> Enable CORS Support </label>
                                                <p>Only enable this in case of CORS error</p>
                                            </th>
                                            <td>
                                                <div >
                                                    <input type="checkbox" id="cors_status" name="cors_status" value={cors_status} onChange={(e) => { setCors(e.target.value) }} className="regular-text" />

                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th scope="row">
                                                <label htmlFor="cors_status"> Enter subscription Id : </label>
                                            </th>
                                            <td>
                                                <div >
                                                    <input type="number" id="sub_id" name="sub_id" value={sub_id} onChange={(e) => { setSubid(e.target.value) }} className="regular-text" />

                                                </div>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>
                            <div className="footer">
                                <p className="submit">
                                    <button type="submit" className="button button-primary">{loader}</button>
                                </p>
                            </div>
                        </form>

                    </div>

                    <div className="setting-card">
                        <div className="head"> Wooventory Hub </div>
                        <div className='content img-bg'>
                            <img className="hub-logo" src={"../wp-content/plugins/wooventory/media/wooventory-login-banner.png"} alt={"HUb-Logo"} />
                        </div>
                        <div className="footbg">
                            <p> Manage staff, receipts, reports, account settings and more. </p>
                            <button class="op-button-transparent">
                                <a href="https://app.wooventory.com" target="_blank" id="op-transparent"> Launch Hub </a>
                            </button>
                        </div>
                    </div>
                    <div className="setting-card">
                        <div className="head"> Need a Hand? </div>
                        <div className='content'>
                            <div class="op-portlet-need">
                                <ul>
                                    <li>
                                        <i class="calendar alternate outline"></i>
                                    </li>
                                    <li>
                                        <h6>Schedule a Meeting</h6>
                                        <p>Book a Demo with our Sales Team</p>
                                    </li>
                                    <li>
                                        <button class="op-btn-transparent">
                                            <a href="https://app.wooventory.com/pricing" target="_blank">Book Now</a>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div class="op-portlet-need">
                                <ul>
                                    <li>
                                        <i class="calendar alternate outline"></i>
                                    </li>
                                    <li>
                                        <h6>Ask Our Knowledge Base</h6>
                                        <p>Get help right away</p>
                                    </li>
                                    <li>
                                        <button class="op-btn-transparent">
                                            <a href="https://docs.wooventory.com/portal/en/kb/setup" target="_blank">Open Knowledge Base</a>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div class="op-portlet-need">
                                <ul>
                                    <li>
                                        <i class="calendar alternate outline"></i>
                                    </li>
                                    <li>
                                        <h6>Live Chat</h6>
                                        <p>Talk to a support expert </p>
                                    </li>
                                    <li>
                                        <button class="op-btn-transparent">
                                            <a href="https://wooventory.com/contact/#chat-open" target="_blank">Open Website</a>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>


                    </div>

                </div>

                <div className="rightside">

                    <div className="setting-card">
                        <div className="head">
                            <span className="left"> Your Plan </span>
                            {(subscriptionData.status != null && subscriptionData.status != undefined) ? <span className={subscriptionData.status == "active" ? "right active" : "right not-active" }> {subscriptionData.status} </span> : null}
                        </div>
                        { (subscriptionData.status != null && subscriptionData.status != undefined) ? renderWidget() : showMessage()}
                    </div>

                    <div className="setting-card">

                        <div className="head">Announcements</div>

                        <div className='content'>
                            Coming Soon..
                        </div>

                    </div>



                </div>

            </div>
        </React.Fragment>
    )
}

export default Settings;