
import React, { Component } from 'react';
import { StyleSheet, ListView, View } from 'react-native'
import Swipeout from 'react-native-swipeout'

// redux
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { unblock, loadBlockList } from '../../actions/block'
import { getBlockListByName } from '../../reducers/block'

// 构建组件
import Loading from '../ui/loading'
import Nothing from '../nothing'
import ListFooter from '../ui/list-footer'
import RefreshControl from '../ui/refresh-control'
import ListViewOnScroll from '../../common/list-view-onscroll'
import PeopleItem from '../people-item'
import PostsItem from '../posts-item'

// 公共样式
import gStyles from '../../styles'

class BlockList extends Component {

  constructor (props) {
    super(props)
    this.state = {}
    this.loadList = this.loadList.bind(this)
  }

  componentWillMount() {
    const { list } = this.props
    if (!list.data) this.loadList()
  }

  loadList(callback, restart) {
    const { name, filters } = this.props
    this.props.loadList({ name, filters, callback, restart })
  }

  render() {

    const self = this
    const { list, filters, unblock } = this.props

    if (list.loading && list.data.length == 0 || !list.data) return (<Loading />)
    if (!list.loading && !list.more && list.data.length == 0) return (<Nothing content="没有数据" />)

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let data = ds.cloneWithRows(list.data || [])

    return (
        <ListView
          enableEmptySections={true}
          dataSource={data}
          renderRow={(item)=>{

            var swipeoutBtns = [
              {
                text: '取消屏蔽',
                onPress: ()=>{
                  let data = {}
                  if (item.people_id) data.people_id = item.people_id._id
                  if (item.posts_id) data.posts_id = item.posts_id._id
                  unblock({ data })
                },
                backgroundColor: 'rgb(238, 38, 38)',
                color: '#fff'
              }
            ]

            if (filters.posts_exsits) {
              return (<View style={gStyles['mt10']} key={item._id}>
                <Swipeout right={swipeoutBtns} backgroundColor="#f7f7f8">
                  <PostsItem {...self.props} posts={item.posts_id} />
                </Swipeout>
              </View>)
            } else {
              return (<View key={item._id}>
                <Swipeout right={swipeoutBtns} backgroundColor="#f7f7f8">
                  <PeopleItem {...self.props} people={item.people_id} displayFollowButton={false} displayBlockButton={true} />
                </Swipeout>
              </View>)
            }
          }}
          renderFooter={()=><ListFooter loading={list.loading} more={list.more} />}
          removeClippedSubviews={false}
          refreshControl={<RefreshControl onRefresh={callback=>self.loadList(callback, true)} />}
          onScroll={ListViewOnScroll(self.loadList)}
          scrollEventThrottle={50}
        />
    )
  }

}

export default connect((state, props) => ({
    list: getBlockListByName(state, props.name)
  }),
  (dispatch) => ({
    loadList: bindActionCreators(loadBlockList, dispatch),
    unblock: bindActionCreators(unblock, dispatch)
  })
)(BlockList)
