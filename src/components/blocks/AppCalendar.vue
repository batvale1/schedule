<template>
  <div class="calendar">
    <div v-show="isPopoverShown" ref="tooltip" class="calendar__tool-tip">
      <table class="calendar__tool-tip-table">
        <tr class="calendar__tool-tip-table-row">
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Teacher</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">{{ currentCard.teacher }}</td>
        </tr>
        <tr>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Group</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">{{ currentCard.group }}</td>
        </tr>
        <tr>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Date</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">{{ currentCard.start_date ? $moment(currentCard.start_date).format('DD MMMM, YYYY') : '' }}</td>
        </tr>
        <tr>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Date</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">
            {{ currentCard.start_date ? $moment(currentCard.start_date).format('HH:mm') : '' }} -
            {{ currentCard.start_date ? $moment(currentCard.end_date).format('HH:mm') : '' }}
          </td>
        </tr>
        <tr>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Week Number</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">{{ currentCard.week }}</td>
        </tr>
        <tr>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Chapter</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">{{ currentCard.chapter }}</td>
        </tr>
        <tr>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_header">Level Progress</td>
          <td class="calendar__tool-tip-table-cell calendar__tool-tip-table-cell_data">{{ currentCard.levelProgress }}%</td>
        </tr>
      </table>
    </div>
    <div class="calendar__outer-container">
      <div class="calendar__inner-container">
        <h1 class="calendar__title">Timetable</h1>
        <div class="calendar__settings"></div>
        <div class="calendar__conditions"></div>
      </div>
      <div ref="table" class="calendar__table" :style="{gridTemplateColumns: `40px repeat(${this.daysToDisplay}, minmax(150px, 1fr))`}">
        <app-icon
            @click.native.prevent="prevDay"
            :src="require('@/assets/svg/arrow-left.svg')"
            class="calendar__pagination-btn calendar__pagination-btn_left"
        />
        <div class="calendar__table-time-column">
          <div class="calendar__table-header calendar__table-header"></div>
          <div class="calendar__table-cell" v-for="(item, index) in timesRange" :key="index">
            <span class="calendar__table-time-value">{{ item }}</span>
          </div>
        </div>
        <div class="calendar__table-date-column" v-for="index in daysToDisplay" :key="index">
          <div class="calendar__table-header">
            <p class="calendar__table-day-by-letters">{{ currentDates[index-1].dateByLetters }}, {{ currentDates[index-1].dateByNumber }}</p>
          </div>
          <div
              class="calendar__table-cell calendar__table-cell_data"
              v-for="(cardsByDayItem, cardsByDayItemIndex) in currentDates[index-1].cardsByDay"
              :key="cardsByDayItemIndex"
              @dragenter="(event) => dragEnterHandler(event, cardsByDayItem)"
              @drop="(event) => dropDrag(event, cardsByDayItem, currentDates[index-1].dateISO)"
              @dragover="(event) => event.preventDefault()"
          >
            <div
                class="calendar__subject"
                draggable="true"
                @dragstart="saveDraggableItem(card, cardIndex, currentDates[index-1].cardsByDay)"
                @dragend="clearDraggableItem"
                v-for="(card, cardIndex) in cardsByDayItem.cards" :key="cardIndex"
                :style="{
                left: `${cardIndex === 0 ? 0 : (100 / cardsByDayItem.cards.length) * cardIndex}%`,
                zIndex: cardIndex + 1,
                width: `${100 - (cardIndex === 0 ? 0 : (100 / cardsByDayItem.cards.length) * cardIndex)}%`,
                height: card.height,
                backgroundColor: card.backgroundColor
                }"
                :ref="'subject' + card.id"
                @mouseover="showFullWidthElement($event, card)"
                @mouseleave="hideFullWidthElement(card, {
                left: `${cardIndex === 0 ? 0 : (100 / cardsByDayItem.cards.length) * cardIndex}%`,
                zIndex: cardIndex + 1,
                width: `${100 - (cardIndex === 0 ? 0 : (100 / cardsByDayItem.cards.length) * cardIndex)}%`,
                cardIndex: cardIndex,
                cardsOverall: cardsByDayItem.cards.length,
                })"
            >
              <div class="calendar__subject-wrapper">
                <div class="calendar__card"
                  @mouseover="showPopOver(card)"
                  @mouseleave="hidePopover"
                >
                  <span
                      :ref="'subject_date' + card.id"
                      class="calendar__card-text"
                      :style="{width: `calc(${100 - (cardsByDayItem.cards.length - 1 - cardIndex) / (cardsByDayItem.cards.length - cardIndex) * 100}% - 10px)`}"
                  >
                    {{ card.startDate }} - {{ card.endDate }}
                  </span>
                  <span
                      :ref="'subject_title' + card.id"
                      class="calendar__card-text"
                      :style="{width: `calc(${100 - (cardsByDayItem.cards.length - 1 - cardIndex) / (cardsByDayItem.cards.length - cardIndex) * 100}% - 10px)`}"
                  >
                    {{ card.group }}
                  </span>
                  <div
                      class="calendar__stretch-card-element calendar__stretch-card-element_bottom"
                      @mousedown="(event) => captureStretch(event, card)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <app-icon
            @click.native.prevent="nextDay"
            :src="require('@/assets/svg/arrow-right.svg')"
            class="calendar__pagination-btn calendar__pagination-btn_right"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from "@/components/ui/appIcon";
import { createPopper } from '@popperjs/core';

export default {
  data() {
    return {
      currentCard: {},
      isPopoverShown: false,
      isDragging: false,
      currentDraggableItem: null,
      hourHeight: 58,
      daysToDisplay: 7,
      timesRange: [
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
      ],
      currentDate: this.$moment(),
      cards: [
        {
          id: 1,
          group: 'B1 – Kolette',
          start_date: new Date('2020-10-20T09:00:00'),
          end_date: new Date('2020-10-20T12:00:00'),
          backgroundColor: '#FEEECD',
          teacher: 'Jeremy',
          chapter: '3-4, Units 12-15',
          levelProgress: 78,
          week: '#12',
        },
        {
          id: 2,
          group: 'B2 – Kolette',
          start_date: new Date('2020-10-20T09:00:00'),
          end_date: new Date('2020-10-20T12:00:00'),
          backgroundColor: '#FEEECD',
          teacher: 'Jeremy',
          chapter: '3-4, Units 12-15',
          levelProgress: 78,
          week: '#12',
        },
        {
          id: 3,
          group: 'A1 – Currywuuuuuuuuuuuuuuuur',
          start_date: new Date('2020-10-20T09:00:00'),
          end_date: new Date('2020-10-20T11:00:00'),
          backgroundColor: '#CBC6FF',
          teacher: 'Jeremy',
          chapter: '3-4, Units 12-15',
          levelProgress: 78,
          week: '#12',
        },
        {
          id: 4,
          group: 'A2 – Kolette',
          start_date: new Date('2020-10-20T13:00:00'),
          end_date: new Date('2020-10-20T16:00:00'),
          backgroundColor: '#CBC6FF',
          teacher: 'Jeremy',
          chapter: '3-4, Units 12-15',
          levelProgress: 78,
          week: '#12',
        },
        {
          id: 5,
          group: 'A3 – Currywuuuuuuuuuuuuuuuur',
          start_date: new Date('2020-10-20T10:00:00'),
          end_date: new Date('2020-10-20T11:00:00'),
          backgroundColor: '#CBC6FF',
          teacher: 'Jeremy',
          chapter: '3-4, Units 12-15',
          levelProgress: 78,
          week: '#12',
        },
        {
          id: 6,
          group: 'B3 – Kolette',
          start_date: new Date('2020-10-21T07:00:00'),
          end_date: new Date('2020-10-21T10:00:00'),
          backgroundColor: '#FEEECD',
          teacher: 'Jeremy',
          chapter: '3-4, Units 12-15',
          levelProgress: 78,
          week: '#12',
        },
      ]
    }
  },
  components: {
    AppIcon
  },
  computed: {
    currentDates() {
      const arrToReturn = [];
      let { currentDate } = this;
      const cardsByTimeArray = [];
      for (let i = 0; i < this.timesRange.length; i += 1) {
        cardsByTimeArray.push({ cards: [], time: this.timesRange[i] });
      }
      for (let i = 0; i < this.daysToDisplay + 1; i += 1) {
        arrToReturn.push({
          dateByLetters: this.$moment(currentDate).locale('en').format('ddd').charAt(0)
                  .toUpperCase()
              + this.$moment(currentDate).locale('en').format('ddd').slice(1),
          dateByNumber: this.$moment(currentDate).format('DD'),
          date: this.$moment(currentDate).format('DDMMYYYY'),
          dateISO: this.$moment(currentDate).toISOString(),
          cardsByDay: JSON.parse(JSON.stringify([...cardsByTimeArray])),
        });
        currentDate = this.$moment(currentDate).add(1, 'days');
      }

      arrToReturn.forEach((dataByDay) => {
        dataByDay.cardsByDay.forEach((dataByTime) => {
          dataByTime.cards = this.cards.filter((card) => this.$moment(card.start_date).format('DDMMYYYY') === dataByDay.date
              && this.$moment(card.start_date).format('HH') === dataByTime.time.slice(0, 2));
          dataByTime.cards.forEach(item => {
            item.height = (this.isDragging ? this.hourHeight : ((item.end_date - item.start_date) / 1000 / 3600 * this.hourHeight).toFixed()) + 'px';
            item.startDate = this.$moment(item.start_date).format('HH:mm');
            item.endDate = this.$moment(item.end_date).format('HH:mm');
          })
        });
      });

      return arrToReturn;
    },
  },
  methods: {
    showFullWidthElement(event, card) {
      const { id } = card;
      if (!id) return;
      this.$refs[`subject${id}`][0].style.left = 0;
      this.$refs[`subject${id}`][0].style.zIndex = 50;
      this.$refs[`subject${id}`][0].style.width = '100%';
      this.$refs[`subject_date${id}`][0].style.width = `calc(100% - 10px)`;
      this.$refs[`subject_title${id}`][0].style.width = 'calc(100% - 10px)';
    },

    hideFullWidthElement(card, initialSettings) {
      const { id } = card;
      if (!id) return;
      this.$refs[`subject${id}`][0].style.left = initialSettings.left;
      this.$refs[`subject${id}`][0].style.zIndex = initialSettings.zIndex;
      this.$refs[`subject${id}`][0].style.width = initialSettings.width;
      this.$refs[`subject_date${id}`][0].style.width = `calc(${100 - (initialSettings.cardsOverall - 1 - initialSettings.cardIndex) / (initialSettings.cardsOverall - initialSettings.cardIndex) * 100}% - 10px)`;
      this.$refs[`subject_title${id}`][0].style.width = `calc(${100 - (initialSettings.cardsOverall - 1 - initialSettings.cardIndex) / (initialSettings.cardsOverall - initialSettings.cardIndex) * 100}% - 10px)`;
      this.hidePopover();
    },

    nextDay() {
      this.currentDate = this.$moment(this.currentDate).add(1, 'days');
    },

    prevDay() {
      this.currentDate = this.$moment(this.currentDate).add(-1, 'days');
    },

    dragEnterHandler() {
      this.hidePopover();
    },

    saveDraggableItem(card, index, cardsByDay) {
      setTimeout(() => {
        this.currentDraggableItem = { card, index, cardsByDay };
        this.isDragging = true;
      }, 0)
    },

    clearDraggableItem() {
      this.currentDraggableItem = null;
      this.isDragging = false;
    },

    dropDrag(event, cardsByDayItem, day) {
      event.preventDefault();

      const newTime = cardsByDayItem.time;
      const foundCard = this.cards.find(item => item === this.currentDraggableItem.card);
      const difference = foundCard.end_date.getTime() - foundCard.start_date.getTime();

      foundCard.start_date = new Date(day);
      foundCard.start_date.setHours(0, 0, 0, 0);
      foundCard.start_date.setHours(newTime.slice(0, 2), newTime.slice(3, 2));
      foundCard.end_date.setTime(foundCard.start_date.getTime() + difference);

      this.cards = [...this.cards];
    },

    captureStretch(event, card) {
      event.preventDefault();
      const element = this.$refs[`subject${card.id}`][0];
      element.setAttribute("draggable", false);
      this.originalHeight = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
      this.originalMouseY = event.pageY;
      this.resizingElement = element;
      this.currentCard = card;
      window.addEventListener('mousemove', this.stretch);
      window.addEventListener('mouseup', this.releaseStretch);
    },

    releaseStretch() {
      window.removeEventListener('mousemove', this.stretch);
      window.removeEventListener('mouseup', this.releaseStretch);
      const currentHeight = parseFloat(getComputedStyle(this.resizingElement, null).getPropertyValue('height').replace('px', ''));
      const heightDifference = currentHeight - this.originalHeight;
      let hoursDifference = (heightDifference / this.hourHeight).toFixed(1);
      hoursDifference = Math.round(hoursDifference*2)/2;
      if (hoursDifference !== 0 && hoursDifference % 0.5 === 0) {
        this.currentCard.end_date.setTime(this.currentCard.end_date.getTime() + hoursDifference * 3600 * 1000);
        this.currentCard.endDate = this.$moment(this.currentCard.end_date).format('HH:mm');
        this.cards = [...this.cards];
      } else {
        this.resizingElement.style.height = this.originalHeight + 'px';
      }
      this.resizingElement.setAttribute("draggable", true);
    },

    stretch(event) {
      const height = this.originalHeight + (event.pageY - this.originalMouseY);
      this.resizingElement.style.height = height + 'px';
    },

    showPopOver(card) {
      this.currentCard = card;
      this.$nextTick(() => {
        this.poper.state.elements.reference = this.$refs[`subject_title${card.id}`][0];
        this.poper.forceUpdate();
      });
      this.isPopoverShown = true;
    },

    hidePopover() {
      this.currentCard = {};
      this.isPopoverShown = false;
    },
  },
  mounted() {
    this.poper = createPopper(this.$el, this.$refs.tooltip, {
      placement: 'right-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [10, 20],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: this.$refs.table,
          },
        },
      ],
    });
  }
}
</script>

<style lang="scss" scoped>
  .calendar {

    &__tool-tip-table-cell {
      font-style: normal;
      font-weight: normal;

      &:first-child {
        display: block;
        margin-right: 26px;
      }

      &_header {
        font-size: 18px;
        line-height: 160%;
        color: #7D7D7D;
      }

      &_data {
        font-size: 16px;
        line-height: 24px;
        color: #383838;
      }
    }

    &__tool-tip {
      min-width: 436px;
      background: #FAFAFA;
      border-radius: 8px;
      z-index: 1000;
      padding: 24px 30px;
    }

    &__outer-container {
      padding: 45px 25px 10px;
    }

    &__inner-container {
      padding-left: 52px;
    }

    &__settings {
      min-height: 30px;
      background-color: #021a1a;
    }

    &__conditions {
      min-height: 60px;
      background-color: #fff;
      margin-top: 16px;
      background-color: #08137e;
    }

    &__table {
        margin-top: 24px;
        border: 1px solid #E8E8E8;
        box-sizing: border-box;
        border-radius: 6px;
        display: grid;
        justify-items: center;
        position: relative;
        grid-column-gap: 7px;
    }

    &__table-cell {
      height: 58px;
      border-top: 1px dashed #E8E8E8;
      border-bottom: 1px dashed #E8E8E8;
      display: flex;
      position: relative;
      align-items: center;
      box-sizing: border-box;
    }

    &__table-cell_data {
      background-color: #FFFFFF;
    }

    &__table-cell_drag-enter {
      border-top: 4px solid rgba(132, 201, 255);
      z-index: 100000;
    }

    &__table-header {
      height: 64px;
      box-sizing: border-box;
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 64px;
      color: #72849E;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__table-time-column {
      width: 100%;
    }

    &__table-date-column {
      width: 100%;
    }

    &__table-day-by-letters {
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      color: #767677;
    }

    &__table-time-value {
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      color: #767677;
      padding: 6px;
    }

    &__subject {
      border: 1px solid #E8E8E8;
      border-left: 6px solid #23A9FC;
      border-radius: 4px;
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      width: 100%;
      position: absolute;
      background-color: white;
      cursor: pointer;
      top: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }

    &__subject-content {
      padding: 10px;
      position: relative;
      overflow: hidden;
      height: 100px;
    }

    &__subject-logo {
      width: 28px;
      height: 28px;
      object-fit: cover;
    }

    &__subject-header {
      display: flex;
      align-items: center;
    }

    &__subject-title {
      margin-left: 10px;
      color: #23A9FC;
      max-width: 80px;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-y: hidden;
    }

    &__actions {
      position: absolute;
      top: 10px;
      right: 5px;
    }

    &__theme {
      margin-top: 10px;
    }

    &__subject-wrapper {
      position: relative;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    &__pagination-btn {
      position: absolute;
      width: 48px;
      height: 24px;
      cursor: pointer;
      top: 32px;
      transform: translateY(-50%);

      &_right {
        right: 10px;
      }

      &_left {
        left: 10px;
      }
    }

    &__card {
      height: 58px;
      padding: 10px 0 16px 10px;
      position: relative;
      box-sizing: border-box;
      flex-grow: 1;
    }

    &__stretch-card-element {
      position: absolute;
      border-top: 4px solid #144666;
      width: 40px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      cursor: row-resize;

      &_top {
        top: 0;
      }

      &_bottom {
        bottom: 0;
      }
    }

    &__card:hover &__stretch-card-element {
      display: block;
    }

    &__card-text {
      display: block;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
</style>