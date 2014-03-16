--[[
name: quiz_update
keys: %quizset%, %word_key%, %star_key%, %interval_list%
argv: %now_time%, %coefficient%
]]--

local intervals
if redis.call('EXISTS', %interval_list%) == 1 then
  intervals = redis.call('GET', %interval_list%)
else
  intervals = {5, 15, 60, 180, 720, 2880, 5760, 11520, 23040}
end

local star = tonumber(redis.call('GET', %star_key%))
local time = %now_time% + intervals[star] * (1 + %coefficient%) * 60 * 1000

return redis.call('ZADD', %quizset%, time, %word_key%)
